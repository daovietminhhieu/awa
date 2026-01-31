import React, { useState, useRef, useEffect } from "react";
import "./Form.css";
import { upFileToStorage } from "../../api";
import { QuillEditor } from "../editor/QuillEditor";
import Columns11 from "../grids/Columns1_1";

const emptyForm = {
  name: "",
  country: "",
  duration: "",
  company: "",
  bonus: "",
  expectedIncome: "",
  fee: "",
  quota: "",
  industry: "",
  type: "",
  progLogo: "",
  benefits: "",
  requirements: "",
  overviews: "",
  costs: "",
  documents: "",
  roadmaps: "",
  deadline: ""
};

const BASIC_FIELDS = [
  { name: "name", label: "Name" },
  { name: "country", label: "Country" },
  { name: "duration", label: "Duration" },
  { name: "company", label: "Company" },
  { name: "bonus", label: "Bonus" },
  { name: "expectedIncome", label: "Expected Income" },
  { name: "fee", label: "Fee" },
  { name: "quota", label: "Quota" },
  { name: "industry", label: "Industry" },
  { name: "type", label: "Type" },
  { name: "deadline", label: "Deadline", type: "date" },
];
function BasicField({ label, name, value, onChange, type = "text" }) {
  return (
    <label>
      {label}:
      <input
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
      />
    </label>
  );
}


export default function AddProgramForm({ title, onSubmit, onClose, defaultValues }) {
  const [formData, setFormData] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [overviews, setOverviews] = useState("");
  const [benefits, setBenefits] = useState("");
  const [costs, setCosts] = useState("");
  const [documents, setDocuments] = useState("");
  const [roadmaps, setRoadMaps] = useState("");

  const [fileType, setFileType] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (defaultValues) {
      setFormData({ ...emptyForm, ...defaultValues });

      setRequirements(defaultValues.requirements || "");
      setOverviews(defaultValues.overviews || ""),
      setBenefits(defaultValues.benefits || "");
      setCosts(defaultValues.costs || "");
      setDocuments(defaultValues.documents || "");
      setRoadMaps(defaultValues.roadmaps || "")
    }
  }, [defaultValues]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      alert("Only image or video allowed");
      return;
    }

    setUploading(true);
    try {
      const url = await upFileToStorage(file);
      setFileType(isVideo ? "video" : "image");
      setFormData((prev) => ({ ...prev, progLogo: url }));
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      requirements,
      overviews,
      benefits,
      costs,
      documents,
      roadmaps
    };

    await onSubmit(payload);
    onClose();
  };


  return (
    <div className="edit-modal">
      <div className="edit-form">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{title} Program</h2>
        <form onSubmit={handleSubmit}>
          <h3>Basic Info</h3>

        <Columns11>
          {BASIC_FIELDS.map(({ name, label, type }) => (
            <BasicField
              key={name}
              name={name}
              label={label}
              type={type}
              value={formData[name]}
              onChange={handleChange}
            />
          ))}
        </Columns11>

          <h3>Media</h3>
          <input type="file" accept="image/*,video/*" onChange={handleFileChange} ref={fileInputRef} />
          {formData.progLogo && (
            <div style={{ marginTop: 10 }}>
              {fileType === "image" ? <img src={formData.progLogo} style={{ width: 200 }} /> :
               <video src={formData.progLogo} controls style={{ width: 220 }} />}
            </div>
          )}

          <div style={{height:40}}></div>
          <QuillEditor title="Overview" value={overviews} onChange={setOverviews}/>
          <div style={{height:40}}></div>
          <QuillEditor title="Requirement" value={requirements} onChange={setRequirements}/>
          <div style={{height:40}}></div>
          <QuillEditor title="Benefit" value={benefits} onChange={setBenefits}/>
          <div style={{height:40}}></div>
          <QuillEditor title="Costs" value={costs} onChange={setCosts}/>
          <div style={{height:40}}></div>
          <QuillEditor title="Documents" value={documents} onChange={setDocuments}/>
          <div style={{height:40}}></div>
          <QuillEditor title="Roadmaps" value={roadmaps} onChange={setRoadMaps}/>
 

          {/* <h3>Benefits</h3>
          {["salary","overtime","insurance","housing","study"].map(f => (
            <label key={f}>{f}: <input name={`benefits.${f}`} value={formData.benefits?.[f] || ""} onChange={handleChange} /></label>
          ))} */}

          {/* <h3>Requirements</h3>
          {["education","experience","language","age","health","degree"].map(f => (
            <label key={f}>{f}: <input name={`requirements.${f}`} value={formData.requirements?.[f] || ""} onChange={handleChange} /></label>
          ))} */}

          {title === "Edit" && defaultValues?.posts?.length > 0 && (
            <>
              <div style={{ height: 30 }} />

              <div>
                Related Posts:
                  {defaultValues.posts.map((pId) => {
                    return (
                        <span style={{marginLeft: 10, display:"flex", flexWrap:"wrap"}}>{pId}</span>
                    );
                  })}
              </div>
            </>
          )}

          <div className="form-buttons">
            <button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Save"}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>

          
        </form>
      </div>
    </div>
  );
}
