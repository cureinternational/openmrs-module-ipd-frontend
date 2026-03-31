import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FormattedMessage, useIntl } from "react-intl";
import {
  DataTableSkeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
} from "carbon-components-react";
import { IPDContext } from "../../../../context/IPDContext";
import {
  careInstructionsHeaders,
  extractInstructionsFromObs,
  fetchEncounterObs,
} from "../utils/CareInstructionsUtils";
import { getDateTimeFromEpochTime } from "../../../../utils/DateTimeUtils";
import "../styles/CareInstructions.scss";

const CareInstructions = (props) => {
  const { config: { formConcepts = [] } = {} } = props;
  const ipdContext = useContext(IPDContext);
  const intl = useIntl();
  const {
    allFormsFilledInCurrentVisit = [],
    isAllFormsFilledInCurrentVisitLoading,
    config,
  } = ipdContext;
  const { enable24HourTime = false } = config || {};

  const [instructions, setInstructions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadInstructions = async () => {
      if (isAllFormsFilledInCurrentVisitLoading) return;
      if (formConcepts.length === 0) return;

      setIsLoading(true);

      const configuredFormNames = formConcepts.map((fc) => fc.formName);

      const matchingFormEntries = allFormsFilledInCurrentVisit.filter((form) =>
        configuredFormNames.includes(form.formName)
      );

      const allInstructions = [];

      await Promise.all(
        matchingFormEntries.map(async (formEntry) => {
          const formConceptConfig = formConcepts.find(
            (fc) => fc.formName === formEntry.formName
          );
          if (!formConceptConfig) return;

          const encounterData = await fetchEncounterObs(
            formEntry.encounterUuid
          );
          if (!encounterData || !encounterData.observations) return;

          const extracted = extractInstructionsFromObs(
            encounterData.observations,
            formConceptConfig.concepts
          );

          extracted.forEach((item) => {
            allInstructions.push({
              id: `${formEntry.encounterUuid}-${item.conceptName}`,
              dateAndTime: getDateTimeFromEpochTime(
                formEntry.encounterDateTime,
                enable24HourTime
              ),
              encounterDateTime: formEntry.encounterDateTime,
              form: formEntry.formName,
              instructionType: item.conceptName,
              instruction: item.value,
              providerName:
                formEntry.providers && formEntry.providers.length > 0
                  ? formEntry.providers[0].providerName
                  : "",
              action: "",
            });
          });
        })
      );

      allInstructions.sort((a, b) => b.encounterDateTime - a.encounterDateTime);

      setInstructions(allInstructions);
      setIsLoading(false);
    };

    loadInstructions();
  }, [allFormsFilledInCurrentVisit, isAllFormsFilledInCurrentVisitLoading]);

  const isDataLoading = isAllFormsFilledInCurrentVisitLoading || isLoading;

  const renderNotAcknowledgedContent = () => {
    if (instructions.length === 0) {
      return (
        <div className={"no-care-instructions"}>
          <FormattedMessage
            id={"NO_CARE_INSTRUCTIONS_MESSAGE"}
            defaultMessage={
              "No care instructions are available for the patient"
            }
          />
        </div>
      );
    }

    return (
      <Table useZebraStyles>
        <TableHead>
          <TableRow>
            {careInstructionsHeaders.map((header) => (
              <TableHeader key={header.key}>{header.header}</TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {instructions.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.dateAndTime}</TableCell>
              <TableCell>{row.form}</TableCell>
              <TableCell>{row.instructionType}</TableCell>
              <TableCell>{row.instruction}</TableCell>
              <TableCell>{row.providerName}</TableCell>
              <TableCell>{row.action}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderAcknowledgedContent = () => {
    return (
      <div className={"no-acknowledged-records"}>
        <FormattedMessage
          id={"NO_ACKNOWLEDGED_RECORDS_MESSAGE"}
          defaultMessage={"No records available"}
        />
      </div>
    );
  };

  if (isDataLoading) {
    return <DataTableSkeleton rowCount={3} columnCount={6} />;
  }

  return (
    <div className={"care-instructions-display-control"}>
      <Tabs>
        <Tab
          id="notAcknowledged"
          label={intl.formatMessage({
            id: "NOT_ACKNOWLEDGED_TAB",
            defaultMessage: "Not Acknowledged",
          })}
        >
          {renderNotAcknowledgedContent()}
        </Tab>
        <Tab
          id="acknowledged"
          label={intl.formatMessage({
            id: "ACKNOWLEDGED_TAB",
            defaultMessage: "Acknowledged",
          })}
        >
          {renderAcknowledgedContent()}
        </Tab>
      </Tabs>
    </div>
  );
};

CareInstructions.propTypes = {
  config: PropTypes.shape({
    formConcepts: PropTypes.arrayOf(
      PropTypes.shape({
        formName: PropTypes.string.isRequired,
        concepts: PropTypes.arrayOf(PropTypes.string).isRequired,
      })
    ),
  }),
};

export default CareInstructions;
