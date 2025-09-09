// src/styles/dataTableCustomStyles.js

const dataTableCustomStyles = {
  headRow: {
    style: {
      minHeight: '44px', // Set your desired min-height here
    },
  },
  rows: {
    style: {
      fontSize: "14px",
    },
  },
  headCells: {
    style: {
      backgroundColor: 'var(--bs-theme2)',
      color: "#1D2939",
      fontSize: "12px",
      fontWeight: '700',
      padding: "10px 12px",
      textTransform: 'uppercase',
    },
  },
  cells: {
    style: {
      color: 'var(--bs-body-color)',
      fontSize: "13px",
      padding: "5px 12px",
    },
  },
};

export default dataTableCustomStyles;
