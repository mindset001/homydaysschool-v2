import React from "react";

interface IPaginstionProps {
  currentPage?: number;
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>;
  next: () => void;
  prev: () => void;
  totalPages?: number;
}

const Pagination = (props: IPaginstionProps) => {
  return (
    <>
      <div className="pagination">
        <button className="prev hsm-normal-btn add-btn" onClick={props.prev}>
          <span>{"<<"}</span> Prev
        </button>
        <button className="next hsm-normal-btn add-btn" onClick={props.next}>
          Next <span>{">>"}</span>
        </button>
      </div>
    </>
  );
};

export default Pagination;
