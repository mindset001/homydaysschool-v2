import React, { useEffect, useMemo } from "react";

const FilePreview: React.FC<{
  filePreview: string[];
  className: string;
  filePreviewToggle: boolean;
  setFilePreviewToggle: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ filePreview, className, filePreviewToggle, setFilePreviewToggle }) => {
  // const [docInfo, setDocInfo] = useState<boolean>(true);
  const filePreviewHead = useMemo(() => {
    if (filePreview.length === 0) return [];
    return Object.keys(filePreview[0])
      .filter(
        (key, index) => index === 0 || !key.toLowerCase().includes("empty")
      )
      .map((value) => (value.toLowerCase().includes("empty") ? "" : value));
  }, [filePreview]);
  useEffect(() => {
    if (filePreview.length > 0) {
      console.log("filePreviewHead", filePreview);
    }
  }, [filePreview, filePreviewHead]);

  // const handlePrint = () => {
  //   setDocInfo(false);
  //   console.log();
  //   window.print();
  //   setDocInfo(true);
  // };
  return (
    filePreviewToggle &&
    filePreview.length > 0 && (
      <div className="result-preview fixed top-0 left-0 right-0 bottom-0 bg-white z-[99999]  p-7 overflow-hidden w-full flex flex-col flex-1">
        <div className="font-bold text-xl lg:text-2xl text-center my-4">
          <div className="mb-2">PREVIEW OF SELECTED RESULT FILE (.XLSX)</div>
          <div>
            <span className="mr-2">CLASS:</span>
            <span>{className.toUpperCase().slice(0,-5)}</span>
          </div>
        </div>
        <div className="overflow-x-scroll max-w-full">
          <table className="mx-auto text-sm">
            <thead>
              <tr>
                {filePreviewHead.map((key, index) => (
                  <th
                    key={index}
                    colSpan={2}
                    //   className={index === 0 ? `w-[500px]` : ``}
                  >
                    {key.length > 17 ? key.slice(0, 17) + ".." : key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filePreview.map((value, index) => (
                <tr key={index} className="tablebody-row">
                  {Object.values(value).map((cellValue, cellIndex) => (
                    <td key={cellIndex}>{cellValue}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* <div className={`my-5 font-semibold block`}>
          <span className="font-bold">Note:*</span> If the document exceeds the
          screen size when printing, adjust the print layout to Landscape and/or
          reduce the printing scale in the "More Settings" section to ensure it
          fits on the page.
        </div> */}
        <div className="tablebody-button">
          {/* <button onClick={handlePrint}>Print</button> */}
          <button onClick={() => setFilePreviewToggle(false)}>Close</button>
        </div>
        
      </div>
    )
  );
};

export default FilePreview;
