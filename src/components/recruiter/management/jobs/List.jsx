import { useState } from "react";
import Card from "./Card";
import Form from "./Form";
import './List.css'


 
export default function List({jobs}) {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <>
        <div className="list">
            {jobs.map((job, index) => (
                <Card key={index} job={job} onSubmit={() => setSelectedJob(job)}/>
            ))}
        </div>

        {selectedJob && (
            <Form job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
    </>
  );
}
