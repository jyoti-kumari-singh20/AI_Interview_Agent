import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import { askAI } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
export const analyzeResume=async(req,res)=>{
    try {
        if(!req.file){
            return res.status(400).json({message:"Resume Required"});
        }
        const filepath=req.file.path;
        const fileBuffer= await fs.promises.readFile(filepath)
        const uint8Array=new Uint8Array(fileBuffer)

        const pdf=await pdfjsLib.getDocument({data:uint8Array}).promise;
        let resumeText="";

        for(let pageNum=1;pageNum<=pdf.numPages;pageNum++){
            const page=await pdf.getPage(pageNum);
            const content=await page.getTextContent();
            const pageText=content.items.map(item=>item.str).join(" ");
            resumeText+=pageText+"\n";
        }

        resumeText=resumeText.replace(/\s+/g," ").trim()

        const messages=[
            {
                role:"system",
                content:`
                Extract structured data from resume.
                Return strictly JSON:
                {"role":"string",
                "experience":"string:,
                "projects":["project1","project2"],
                "skills":["skill1","skill2"]
                }`
            },
            {
                role:"user",
                content:resumeText
            }
        ];

        const aiResponse=await askAI(messages)

        const parsed=JSON.parse(aiResponse);
        
        fs.unlinkSync(filepath)

        res.json({
            role:parsed.role,
            experience:parsed.experience,
            projects:parsed.projects,
            skills:parsed.skills,
            resumeText
        });


    } catch (error) {
        console.error(error);
        if(req.file && fs.existsSync(req.file.path)){
            fs.unlinkSync(Request.file.path);
        }
        res.status(500).json({message:error.message});
        
    }
};

export const generateQuestion=async(req,res)=>{
    try {
        const {role,experience,mode,resumeText,projects,skills}=req.body
        role=role?.trim();
        experience=experience?.trim();
        mode=mode?.trim();

        if(!role || !experience || !mode){
            return res.status(400).json({message:"Role, Experience and Mode are required."})
        }
        const user=await User.findById(req.userId)
        if(!user){
            return res.status(404).json({
                message:"User not found."
            });
        }
        if(user.credits<50){
            return res.status(400).json({
                message:"Not enough credits. Minimum 50 required."
            });
        }

        const projectText=Array.isArray(projects) && projects.length ? 
        projects.join(", "):"None";

        const skillsText=Array.isArray(skills) && skills.length ? 
        skills.join(", "):"None";

        const safeResume=resumeText?.trim() || "None";
        const userPrompt=`
        Role:${role}
        Experience:${experience}
        InterviewMode:${mode}
        Projects:${projectText}
        Skills:${skillsText}
        Resume:${safeResume}`;

        if(!userPrompt.trim()){
            return res.status(400).json({
                message:"Prompt content is empty."
            });
        }
        const message=[
            {
                role:"system",
                content:`
                You are a real human interviewer conducting a professional interview.

                Speak in asimple, natural English as if you are directly talking to the 
                candidate.

                Generate exactly 10 interview questions.

                Strict RUles:
                -Each question must contain between 15 and 25 words.
                -Each question must be a single, complete sentence. 
                -Do not number them. 
                -Do not add explanations. 
                -Do not add extra text before or after. 
                -One question per line only. 
                -Keep language simple and conversational. 
                -Questions must feel practical and realistic.

                Difficulty progression:
                Question 1 - easy
                Question 2 - easy
                Question 3 - easy
                Question 4 - medium
                Question 5 - medium
                Question 6 - medium
                Question 7 - medium
                Question 8 - hard
                Question 9 - hard
                Question 10 - hard

                Make questions based on the candidate's role, experience, interviewMode, 
                projects, skills, and resume details.
                `
            },
            {
                role:"user",
                content:userPrompt
            }
        ];

        const aiResponse=await askAI(messages);
    } catch (error) {


        
    }
}