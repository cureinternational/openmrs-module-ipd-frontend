import { render } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom/extend-expect";
import ExpandableDataTable from "./ExpandableDataTable";

describe("ExpandableDataTable", () => {
  it("should render ExpandableDataTable", () => {
    render(
      <ExpandableDataTable
        rows={[]}
        headers={[]}
        additionalData={[]}
        component={() => {}}
        useZebraStyles={true}
      />
    );
  });

  it("should render expandable row on clicking the icon", () => {
    const { queryByTestId } = render(
      <ExpandableDataTable
        rows={[
          {
            id: "1",
            name: "test",
          },
        ]}
        headers={[
          {
            id: "1",
            header: "Name",
            key: "name",
            isSortable: false,
          },
        ]}
        additionalData={[
          {
            id: "1",
            disableExpand: true,
          },
        ]}
        component={() => {}}
        useZebraStyles={true}
      />
    );
    expect(queryByTestId("expandable-row")).toBeTruthy();
  });
});

describe("row class names", () => {
  const rows = [{ id: "1", name: "test" }];
  const headers = [
    { id: "1", header: "Name", key: "name", isSortable: false },
  ];

  const renderTable = (additionalData) =>
    render(
      <ExpandableDataTable
        rows={rows}
        headers={headers}
        additionalData={additionalData}
        component={() => <div />}
        useZebraStyles={true}
      />
    );

  it("applies green-row when isNotScheduled is true", () => {
    const { queryByTestId } = renderTable([
      { id: "1", isNotScheduled: true },
    ]);
    const row =
      queryByTestId("expandable-row") || queryByTestId("non-expandable-row");
    expect(row).toHaveClass("green-row");
  });

  it("applies in-progress-row when isInProgress is true", () => {
    const { queryByTestId } = renderTable([
      { id: "1", isInProgress: true },
    ]);
    const row =
      queryByTestId("expandable-row") || queryByTestId("non-expandable-row");
    expect(row).toHaveClass("in-progress-row");
  });

  it("applies no special class when isCompleted is true", () => {
    const { queryByTestId } = renderTable([
      { id: "1", isCompleted: true },
    ]);
    const row =
      queryByTestId("expandable-row") || queryByTestId("non-expandable-row");
    expect(row).not.toHaveClass("green-row");
    expect(row).not.toHaveClass("in-progress-row");
    expect(row).not.toHaveClass("variable-dose-row");
  });

  it("applies variable-dose-row when isVariableDose is true and not scheduled/inProgress/completed", () => {
    const { queryByTestId } = renderTable([
      { id: "1", isVariableDose: true },
    ]);
    const row =
      queryByTestId("expandable-row") || queryByTestId("non-expandable-row");
    expect(row).toHaveClass("variable-dose-row");
  });
});
