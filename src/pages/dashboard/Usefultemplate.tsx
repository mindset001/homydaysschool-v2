import React from "react";

const Results: React.FC = () => {
  return (
    <div className="results">
      <div className="results-header">Results</div>
      <div className="results-class-container flex-grow">
        <div className="results-class">
          <span>Crèche</span>
          {/* <span>^</span> */}
        </div>
        <div className="results-class">
          <span>K.G 1</span>
          {/* <span>^</span> */}
        </div>
        <div className="results-class">
          <span>K.G 2</span>
          {/* <span>^</span> */}
        </div>
        <div className="results-class">
          <span>Nursery 1</span>
          {/* <span>^</span> */}
        </div>
        <div className="results-class">
          <span>Nursery 2</span>
          {/* <span>^</span> */}
        </div>
        <div className="results-class">
          <span>Primary 1</span>
          {/* <span>^</span> */}
        </div>
        <div className="results-class">
          <span>Primary 2</span>
          {/* <span>^</span> */}
        </div>
        <div className="results-class">
          <span>Primary 3</span>
          {/* <span>^</span> */}
        </div>
        <div className="results-class">
          <span>Primary 4</span>
          {/* <span>^</span> */}
        </div>
        <div className="results-class">
          <span>Primary 5</span>
          {/* <span>^</span> */}
        </div>
      </div>
    </div>
  );
};

export default Results;
