import React, { useRef, useEffect } from "react";
// Quill kutubxonasini import qilamiz
import Quill from "quill";
// Quill-ning CSS faylini import qilamiz (juda muhim!)
import "quill/dist/quill.snow.css"; // "Qor" mavzusi uchun. Yoki "quill.bubble.css" ham bor.

const MyEditor = () => {
  // Editorning DOM elementiga havola (ref) yaratamiz
  const editorRef = useRef(null);
  // Quill instansiyasini saqlash uchun ref
  const quillInstance = useRef(null);

  useEffect(() => {
    // Komponent DOM-ga mount bo‘lganda...
    if (editorRef.current && !quillInstance.current) {
      // Quill-ni ishga tushiramiz
      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow", // yoki 'bubble'
        modules: {
          toolbar: [
            // Quyida toolbar konfiguratsiyasi
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" },
            ],
            ["link", "image", "video", "blockquote", "code-block"],
            ["clean", "undo", "redo"],
          ],
        },
        placeholder: "Mangaingizning matnini shu yerga yozing...",
      });
    }

    // Komponent unmount bo‘lganda, Quill-ni tozalash (agar kerak bo‘lsa)
    return () => {
      // Kerakli tozalash ishlari
    };
  }, []); // Faqat bir marta ishga tushadi

  // Editor matnini olish uchun funktsiya (masalan, saqlash yoki jo‘natish uchun)
  const getEditorContent = () => {
    if (quillInstance.current) {
      // HTML ko‘rinishida olish
      const html = quillInstance.current.root.innerHTML;
      console.log(html);
      // Yoki Delta JSON ko‘rinishida
      const delta = quillInstance.current.getContents();
      console.log(delta);
      return html;
    }
  };

  return (
    <div>
      {/* Quill editor shu div-ga joylashadi */}
      <div ref={editorRef} style={{ height: "500px" }}></div>
      {/* Matnni saqlash tugmasi (ixtiyoriy) */}
      <button onClick={getEditorContent} style={{ marginTop: "20px" }}>
        Saqlash
      </button>
    </div>
  );
};

export default MyEditor;
