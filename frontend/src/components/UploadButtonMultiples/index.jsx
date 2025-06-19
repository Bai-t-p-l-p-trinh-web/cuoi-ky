import { useEffect, useRef } from "react";

function UploadMultipleButton({ cloudName, uwConfig, setUploadImages }) {
  const uploadWidgetRef = useRef(null);
  const uploadButtonRef = useRef(null);

  useEffect(() => {
    const initializeUploadWidget = () => {
      if (window.cloudinary && uploadButtonRef.current) {
        uploadWidgetRef.current = window.cloudinary.createUploadWidget(
          {
            ...uwConfig,
            multiple: true,
          },
          (error, result) => {
            if (!error && result && result.event === "success") {
              const uploadedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${result.info.public_id}.${result.info.format}`;

              // Thêm ảnh vào danh sách
              setUploadImages((prev) => [...prev, uploadedUrl]);
            }
          }
        );

        const handleUploadClick = () => {
          if (uploadWidgetRef.current) {
            uploadWidgetRef.current.open();
          }
        };

        const buttonElement = uploadButtonRef.current;
        buttonElement.addEventListener("click", handleUploadClick);

        return () => {
          buttonElement.removeEventListener("click", handleUploadClick);
        };
      }
    };

    initializeUploadWidget();
  }, [uwConfig, setUploadImages]);

  return (
    <>
      <div className="upload-multiple" ref={uploadButtonRef}>
        <button className="upload-multiple-button">
          Upload Multiple Photos
        </button>
      </div>
    </>
  );
}

export default UploadMultipleButton;
