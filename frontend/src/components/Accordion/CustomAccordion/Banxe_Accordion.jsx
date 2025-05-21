import { useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";

function BanxeAccordion({questions}){
    const [openQuestion, setOpenQuestion] = useState([]);

    const ToggleOpen = (num) => {
        setOpenQuestion(prev => {
            let updated;
            if(prev.includes(num)){
                updated = prev.filter(item => item != num);
            } else {
                updated = [...prev, num]
            }

            return updated;
        })
    }
    return (
        <>
            <div className="banxe__accordion">
                {
                    questions.length > 0
                    && 
                    questions.map((question, q_index) => (
                        <div className="banxe__accordion__item" key={q_index}>
                            <span className="banxe__accordion__item__question" onClick={() => {ToggleOpen(q_index)}}><span>{question.question}</span> <IoMdArrowDropdown className={"banxe__arrow" + (openQuestion.includes(q_index) ? " rotate" : " ")}/> </span>
                            <hr/>
                            {
                                openQuestion.includes(q_index)
                                &&
                                <div className="banxe__accordion__item__answer">
                                    <pre className="banxe__accordion__item__answer__pre">{question.answer}</pre>
                                    <hr/>
                                </div>
                            }
                        </div>
                    ))
                }
            </div> 
        </>
    )
};
export default BanxeAccordion;