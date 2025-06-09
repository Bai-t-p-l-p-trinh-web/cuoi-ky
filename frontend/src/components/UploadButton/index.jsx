import { useEffect, useRef } from "react";
function UploadButton({ cloudName, uwConfig, setUploadImage }) {
    const uploadWidgetRef = useRef(null);
    const uploadButtonRef = useRef(null);

    useEffect(() => {
        const initializeUploadWidget = () => {
            if(window.cloudinary && uploadButtonRef.current) {

                uploadWidgetRef.current = window.cloudinary.createUploadWidget(
                    uwConfig,
                    (error, result) => {
                        if(!error && result && result.event === 'success') {
                            const coords = result.info.coordinates?.custom?.[0];
                            if(coords) {
                                const [x, y, width, height] = coords;
                                
                                setUploadImage(`https://res.cloudinary.com/${cloudName}/image/upload/c_crop,w_${width},h_${height},x_${x},y_${y}/${result.info.public_id}.${result.info.format}`);
                            } else {
                                setUploadImage(`https://res.cloudinary.com/${cloudName}/image/upload/${result.info.public_id}.${result.info.format}`);
                            }
                            
                            
                        }
                    }
                );

                const handleUploadClick = () => {
                    if(uploadWidgetRef.current) {
                        uploadWidgetRef.current.open();
                    }
                };

                const buttonElement = uploadButtonRef.current;
                buttonElement.addEventListener('click', handleUploadClick);

                return () => {
                buttonElement.removeEventListener('click', handleUploadClick);
                };
            }
        };

        initializeUploadWidget();

    }, [uwConfig, setUploadImage]);

    return (
        <>
            <div className="dashboard__header__settings__button__contain" ref={uploadButtonRef}>
                <button className="dashboard__header__settings__button">
                    Upload Photo
                </button>
            </div>
        </>
    )
};
export default UploadButton;