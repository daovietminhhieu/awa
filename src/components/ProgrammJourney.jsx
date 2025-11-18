import React, { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import {
  getProgrammById,
  getProgrammCosts,
  addProgrammCost,
  updateProgrammCost,
  deleteProgrammCost,
  getProgrammDocuments,
  addProgrammDocument,
  updateProgrammDocument,
  deleteProgrammDocument,
  getProgrammSteps,
  addProgrammStep,
  updateProgrammStep,
  deleteProgrammStep,
} from "../api";
import { useAuth } from "../context/AuthContext";

// Hook để theo dõi chiều rộng màn hình
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

export default function ProgrammJourney({ program }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [programm, setProgramm] = useState(null);

  const width = useWindowWidth();
  const isMobile = width <= 600;

  // Costs
  const [costs, setCosts] = useState([]);
  const [editingCost, setEditingCost] = useState(null);
  const [newCost, setNewCost] = useState({ item: "", note: "" });

  // Documents
  const [documents, setDocuments] = useState([]);
  const [editingDoc, setEditingDoc] = useState(null);
  const [newDoc, setNewDoc] = useState({ name: "" });

  // Steps
  const [steps, setSteps] = useState([]);
  const [editingStep, setEditingStep] = useState(null);
  const [newStepName, setNewStepName] = useState("");

  useEffect(() => {
    if (program?._id) loadData(program._id);
  }, [program]);

  const loadData = async (id) => {
    try {
      const pg = await getProgrammById(id);
      const cs = await getProgrammCosts(id);
      const docs = await getProgrammDocuments(id);
      const st = await getProgrammSteps(id);

      setProgramm(pg.data || pg);
      setCosts(cs || []);
      setDocuments(docs || []);
      setSteps(st || []);
    } catch (error) {
      console.error("Error loading program data:", error);
    }
  };

  // ===== COSTS CRUD =====
  const onAddCost = async () => {
    if (!newCost.item.trim()) return;
    try {
      const created = await addProgrammCost(program._id, newCost);
      setCosts([...costs, created]);
      setNewCost({ item: "", note: "" });
    } catch (e) {
      console.error("Add cost failed:", e);
    }
  };

  const onUpdateCost = async () => {
    try {
      const updated = await updateProgrammCost(program._id, editingCost._id, editingCost);
      setCosts(costs.map((c) => (c._id === updated._id ? updated : c)));
      setEditingCost(null);
    } catch (e) {
      console.error("Update cost failed:", e);
    }
  };

  const onDeleteCost = async (id) => {
    try {
      await deleteProgrammCost(program._id, id);
      setCosts(costs.filter((c) => c._id !== id));
    } catch (e) {
      console.error("Delete cost failed:", e);
    }
  };

  // ===== DOCUMENTS CRUD =====
  const onAddDocument = async () => {
    if (!newDoc.name.trim()) return;
    try {
      const created = await addProgrammDocument(program._id, newDoc);
      setDocuments([...documents, created]);
      setNewDoc({ name: "" });
    } catch (e) {
      console.error("Add document failed:", e);
    }
  };

  const onUpdateDocument = async () => {
    try {
      const updated = await updateProgrammDocument(program._id, editingDoc._id, editingDoc);
      setDocuments(documents.map((d) => (d._id === updated._id ? updated : d)));
      setEditingDoc(null);
    } catch (e) {
      console.error("Update document failed:", e);
    }
  };

  const onDeleteDocument = async (id) => {
    try {
      await deleteProgrammDocument(program._id, id);
      setDocuments(documents.filter((d) => d._id !== id));
    } catch (e) {
      console.error("Delete document failed:", e);
    }
  };

  // ===== STEP CRUD =====
  const onAddStep = async () => {
    if (!newStepName.trim()) return;
    try {
      const stepNumber = steps.length + 1;
      const created = await addProgrammStep(program._id, { step: stepNumber, name: newStepName });
      setSteps([...steps, created]);
      setNewStepName("");
    } catch (err) {
      console.error("Add step failed:", err);
    }
  };

  const onUpdateStep = async () => {
    try {
      const updated = await updateProgrammStep(program._id, editingStep._id, editingStep);
      setSteps(steps.map((s) => (s._id === updated._id ? updated : s)));
      setEditingStep(null);
    } catch (err) {
      console.error("Update step failed:", err);
    }
  };

  const onDeleteStep = async (id) => {
    try {
      await deleteProgrammStep(program._id, id);
      setSteps((prev) => prev.filter((s) => s._id !== id).map((s, i) => ({ ...s, step: i + 1 })));
    } catch (err) {
      console.error("Delete step failed:", err);
    }
  };

  // === INLINE STYLE ===
  const listItemStyle = {
    flex: isMobile ? "1 1 100%" : "1 1 48%",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
    width: "450px"
  };

  const tableStyle = { width: "100%", borderCollapse: "collapse" };
  const thTdStyle = { border: "1px solid #ddd", padding: "8px", textAlign: "left" };
  const mobileCostRowStyle = {
    border: "1px solid #ddd",
    padding: "8px",
    marginBottom: "12px",
    display: "flex", justifyContent:"center",
    flexDirection: "column",
    gap: "4px",
    height:125
  };

  const addDiv = {
    width:"380px",marginTop:20,
    display:"flex",justifyContent:"space-between"
  }

  return (
    <div className="programm-journey">
      {/* STEPS */}
      <section>
        <h3>Program Steps</h3>
        <div style={{height:10}}></div>
        <ul style={{ display: "flex", flexDirection:"column", width:500, padding: 0, listStyleType: "disc" }}>
          {steps.map((step) => (
            <li key={step._id} style={listItemStyle}>
              {editingStep?._id === step._id ? (
                <input
                  value={editingStep.name}
                  onChange={(e) => setEditingStep({ ...editingStep, name: e.target.value })}
                  style={{ flexGrow: 1 }}
                />
              ) : (
                <>
                  <span style={{ marginRight: 8 }}>•</span>
                  <span style={{ flexGrow: 1 }}>{step.name}</span></>
              )}
              {user?.role === "admin" && (
                <span className="actions" style={{ display: "flex", gap: "5px" }}>
                  {editingStep?._id === step._id ? (
                    <>
                      <button onClick={onUpdateStep}>Save</button>
                      <button onClick={() => setEditingStep(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingStep(step)}>Edit</button>
                      <button onClick={() => onDeleteStep(step._id)}>Delete</button>
                    </>
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
        {user?.role === "admin" && !editingStep && (
          <div style={addDiv}>
            <input
              placeholder="Step name…"
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              style={{ padding: "4px 6px", marginRight: "8px" }}
            />
            <button onClick={onAddStep}>Add</button>
          </div>
        )}
      </section>

      <div style={{ height: 30 }}></div>

      {/* DOCUMENTS */}
      <section>
        <h3>Required Documents</h3>
        <div style={{height:10}}></div>
        <ul style={{ display: "flex", flexDirection:"column", width:500, flexWrap: "wrap" }}>
          {documents.map((doc) => (
            <li key={doc._id} style={listItemStyle}>
              {editingDoc?._id === doc._id ? (
                <input
                  value={editingDoc.name}
                  onChange={(e) => setEditingDoc({ ...editingDoc, name: e.target.value })}
                  style={{ flexGrow: 1 }}
                />
              ) : (
                <><span style={{ marginRight: 8 }}>•</span>
                <span style={{ flexGrow: 1 }}>{doc.name}</span></>
              )}
              {user?.role === "admin" && (
                <span className="actions" style={{ display: "flex", gap: "5px" }}>
                  {editingDoc?._id === doc._id ? (
                    <>
                      <button onClick={onUpdateDocument}>Save</button>
                      <button onClick={() => setEditingDoc(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingDoc(doc)}>Edit</button>
                      <button onClick={() => onDeleteDocument(doc._id)}>Delete</button>
                    </>
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>

        {user?.role === "admin" && !editingDoc && (
          <div style={addDiv}>
            <input
              placeholder="Document name…"
              value={newDoc.name}
              onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
              style={{ padding: "4px 6px", marginRight: "8px" }}
            />
            <button onClick={onAddDocument}>Add</button>
          </div>
        )}
      </section>

      <div style={{ height: 30 }}></div>

      {/* COST TABLE */}
      <section>
        <h3>Costs</h3>
        <div style={{height:10}}></div>
        {!isMobile ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thTdStyle}>Item</th>
                <th style={thTdStyle}>Note</th>
                {user?.role === "admin" && <th style={thTdStyle}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {costs.map((row) => (
                <tr key={row._id}>
                  <td style={thTdStyle}>
                    {editingCost?._id === row._id ? (
                      <input
                        value={editingCost.item}
                        onChange={(e) => setEditingCost({ ...editingCost, item: e.target.value })}
                      />
                    ) : (
                      row.item
                    )}
                  </td>
                  <td style={thTdStyle}>
                    {editingCost?._id === row._id ? (
                      <input
                        value={editingCost.note}
                        onChange={(e) => setEditingCost({ ...editingCost, note: e.target.value })}
                      />
                    ) : (
                      row.note
                    )}
                  </td>
                  {user?.role === "admin" && (
                    <td style={{...thTdStyle, gap:5, display:"flex"}} >
                      {editingCost?._id === row._id ? (
                        <>
                          <button onClick={onUpdateCost}>Save</button>
                          <button onClick={() => setEditingCost(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditingCost(row)}>Edit</button>
                          <button onClick={() => onDeleteCost(row._id)}>Delete</button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {/* Add Row */}
              {user?.role === "admin" && (
                <tr>
                  <td style={thTdStyle}>
                    <input
                      placeholder="Item…"
                      value={newCost.item}
                      onChange={(e) => setNewCost({ ...newCost, item: e.target.value })}
                    />
                  </td>
                  <td style={thTdStyle}>
                    <input
                      placeholder="Note…"
                      value={newCost.note}
                      onChange={(e) => setNewCost({ ...newCost, note: e.target.value })}
                    />
                  </td>
                  <td style={thTdStyle}>
                    <button onClick={onAddCost}>Add</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div>
            {costs.map((row) => (
              <div key={row._id} style={mobileCostRowStyle}>
                <div>
                  <strong>Item:</strong> {editingCost?._id === row._id ? (
                    <input
                      value={editingCost.item}
                      onChange={(e) => setEditingCost({ ...editingCost, item: e.target.value })}
                      style={{border:"2px solid black", width:"50%"}}
                    />
                  ) : (
                    row.item
                  )}
                </div>
                <div>
                  <strong>Note:</strong> {editingCost?._id === row._id ? (
                    <input
                      value={editingCost.note}
                      onChange={(e) => setEditingCost({ ...editingCost, note: e.target.value })}
                      style={{border:"2px solid black", width:"50%"}}
                    />
                  ) : (
                    row.note
                  )}
                </div>
                {user?.role === "admin" && (
                  <div style={{display:"flex", gap:5,}}>
                    {editingCost?._id === row._id ? (
                      <>
                        <button onClick={onUpdateCost}>Save</button>
                        <button onClick={() => setEditingCost(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingCost(row)}>Edit</button>
                        <button onClick={() => onDeleteCost(row._id)}>Delete</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add row */}
            {user?.role === "admin" && (
              <div style={{ ...mobileCostRowStyle }}>
                <input
                  placeholder="Item…"
                  value={newCost.item}
                  onChange={(e) => setNewCost({ ...newCost, item: e.target.value })}
                  style={{width:"50%"}}
                />
                <input
                  placeholder="Note…"
                  value={newCost.note}
                  onChange={(e) => setNewCost({ ...newCost, note: e.target.value })}
                  style={{width:"50%"}}
                />
                <button style={{width:"fit-content", marginTop:5}} onClick={onAddCost}>Add</button>
              </div>
            )}
          </div>
        )}
      </section>

     
    </div>
  );
}
