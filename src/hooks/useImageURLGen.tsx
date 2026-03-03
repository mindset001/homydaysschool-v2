// // import React from 'react'

// import { useState } from "react";
// interface useImageURLGenI {
//   image: File | null;
//   setImage: React.Dispatch<React.SetStateAction<File | null>>;
//   uploadImage: () => void;
//   url: string;
//   isLoadingURL : boolean;
//   isErrorURL: boolean;
//   errorURL: string;
// }
// const useImageURLGen = (): useImageURLGenI => {
//   const [isLoadingURL, setIsLoadingURL] = useState<boolean>(false);
//   const [errorURL, setErrorURL] = useState<string>("");
//   const [isErrorURL, setIsErrorURL] = useState<boolean>(false);
//   const [image, setImage] = useState<File | null>(null);
//   const [url, setUrl] = useState("");
//   const uploadImage = () => {
//     if (!image) return;
//     setIsLoadingURL(true);
//     const data = new FormData();
//     data.append("file", image);
//     data.append(
//       "upload_preset",
//       import.meta.env.VITE_REACT_APP_CLOUDINARY_UPLOAD_PRESET
//     );
//     data.append(
//       "cloud_name",
//       import.meta.env.VITE_REACT_APP_CLOUDINARY_CLOUD_NAME
//     );
//     fetch(
//       `https://api.cloudinary.com/v1_1/${
//         import.meta.env.VITE_REACT_APP_CLOUDINARY_CLOUD_NAME
//       }/image/upload`,
//       {
//         method: "post",
//         body: data,
//       }
//     )
//       .then((resp) => resp.json())
//       .then((data) => {
//         setUrl(data.secure_url);
//         setImage(null);
//         console.log(data);
//       })
//       .catch((err) => {
//         console.log(err);
//         setErrorURL(err);
//         setIsErrorURL(true);
//       })
//       .finally(() => {
//         setIsLoadingURL(false);
//       });
//   };

//   return { image, setImage, uploadImage, url, isLoadingURL, isErrorURL, errorURL };
// };

// export default useImageURLGen;
