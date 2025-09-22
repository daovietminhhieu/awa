import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";

import CourseForm from "../../components/admin/management/courses/Form";
import CourseList from "../../components/admin/management/courses/List";
import coursesData from "../../mocks/courses";

import "./CoursesManagement.css";

// ---- Mock CRUD Services ----
let coursesDB = [...coursesData];

function initCourses() {
  return coursesDB;
}
function add(course) {
  const newCourse = { ...course, id: Date.now() };
  coursesDB.push(newCourse);
}
function update(course) {
  coursesDB = coursesDB.map((c) => (c.id === course.id ? course : c));
}
function remove(id) {
  coursesDB = coursesDB.filter((c) => c.id !== id);
}
function emptyCourse() {
  return {
    title: "",
    university: "",
    country: "",
    level: "",
    duration: "",
    fee: "",
    logo: "",
    status: "active",
    deadline: "",
    bonus: "",
    reward: "",
    vacancies: "",
    tags: [],
    jdFile: "",
    jdFileName: "",
    requirement: "",
    color: "#2196F3",
  };
}

// ---- Main Component ----
export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCourse, setNewCourse] = useState(emptyCourse());
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    const data = initCourses();
    setCourses(data);
  };

  const handleCreate = () => {
    add(newCourse);
    loadCourses();
    setIsCreating(false);
    setNewCourse(emptyCourse());
  };

  const handleUpdate = (course) => {
    update(course);
    loadCourses();
    setEditingCourse(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      remove(id);
      loadCourses();
    }
  };

  return (
    <div>
      <div className="header-bar" style={{display:"flex", justifyContent:"flex-end"}}>
        <button className="add-btn" style={{height:"stretch"}} onClick={() => setIsCreating(true)}>
          <FaPlus />
        </button>
      </div>

      {/* Modal Create */}
      {isCreating && (
        <CourseForm
          course={newCourse}
          handler={setNewCourse}
          buttonText="Create"
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {/* Modal Edit */}
      {editingCourse && (
        <CourseForm
          course={editingCourse}
          handler={(updated) => setEditingCourse(updated)}
          buttonText="Update"
          onSubmit={() => handleUpdate(editingCourse)}
          onCancel={() => setEditingCourse(null)}
        />
      )}

      {/* Danh sách courses */}
      <CourseList
        courses={courses}
        editingCourse={editingCourse}
        setCourses={setCourses}
        setEditingCourse={setEditingCourse}
        handleDelete={handleDelete}
        handleUpdate={handleUpdate}
      />

      
    </div>
  );
}
