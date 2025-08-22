import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#000000ff",
  },

  // Header
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 50,
    color: "#3f3f3fff",
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  invoiceInfo: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20, // space between the two pieces of info
    marginBottom: 5,
  },
  invoiceLabel: {
    fontSize: 15,
    color: "#6B7280",
  },
  invoiceValue: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },

  

  // Sections
  section: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f1f1f1ff",
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#174b9eff",
    marginBottom: 4,
  },
  value: {
    fontSize: 11,
    marginBottom: 2,
    color: "#000000ff",
  },

  // Table
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tableColHeader: {
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#d6d6d6ff",
    padding: 6,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
  },
  tableCol: {
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: "#E5E7EB",
    padding: 6,
    fontSize: 10,
    textAlign: "left",
    flexShrink: 1,
  },
  tableColNumeric: {
    textAlign: "right",
  },

  // Totals & Payment
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 75,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  totalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  paymentValue: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#111827",
  },

  // Logo
  logo: {
    width: 100,
    height: 50,
    objectFit: "contain",
    objectPosition: "left top",
  },
});
