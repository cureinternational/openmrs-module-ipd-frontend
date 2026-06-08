import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Link,
} from "carbon-components-react";
import { FormattedMessage } from "react-intl";
import { TooltipCarbon } from "bahmni-carbon-ui";
import NoteIcon from "../../../../icons/note.svg";
import {
  fhirDosageToDisplayStage,
  computeStageStartDates,
} from "../../../../utils/FhirDosingUtils";
import { formatDate } from "../../../../utils/DateTimeUtils";
import moment from "moment";
import "../styles/VariableDoseStagesTable.scss";

const VariableDoseStagesTable = ({
  fhirDosages,
  effectiveStartDate,
  onAddToDrugChart,
  onEditDrugChart,
  stageSchedules,
  isAddToDrugChartDisabled,
  isReadMode,
  hasScheduleEditPrivilege,
}) => {
  if (!fhirDosages || fhirDosages.length === 0) return null;

  const startDates = computeStageStartDates(fhirDosages, effectiveStartDate);
  const stages = fhirDosages.map(fhirDosageToDisplayStage);
  const loadingDoseCount = stages.filter((s) => s.isLoadingDose).length;

  // Computes which single stage should show the "Add to Drug Chart" button.
  // Based only on scheduling sequence and start dates — privilege/disabled
  // are handled at render time (same as regular orders show disabled button).
  const getActiveStageIndex = () => {
    const statusBySequence = new Map(
      (stageSchedules || []).map((s) => [s.variableDosageSequence, s])
    );
    for (let i = 0; i < fhirDosages.length; i++) {
      const dosage = fhirDosages[i];
      const stageStatus = statusBySequence.get(dosage.sequence);
      if (stageStatus?.isScheduled) continue;
      if (i > 0) {
        const prevDosage = fhirDosages[i - 1];
        const prevStatus = statusBySequence.get(prevDosage.sequence);
        if (prevStatus?.allAttended !== true) break;
      }
      if (moment().valueOf() >= startDates[i]) return i;
      break;
    }
    return -1;
  };

  const activeStageIndex = getActiveStageIndex();
  const isButtonDisabled = !hasScheduleEditPrivilege || isAddToDrugChartDisabled;

  return (
    <div className="vdp-section">
      <p className="vdp-title">
        <FormattedMessage
          id="VARIABLE_DOSAGE_PROTOCOL"
          defaultMessage="Variable Dosage Protocol"
        />
      </p>
      <Table className="vdp-table">
        <TableHead>
          <TableRow>
            <TableHeader>
              <FormattedMessage
                id="VARIABLE_DOSE_STAGE_COLUMN"
                defaultMessage="Stage"
              />
            </TableHeader>
            <TableHeader>
              <FormattedMessage
                id="VARIABLE_DOSE_START_DATE_COLUMN"
                defaultMessage="Start Date"
              />
            </TableHeader>
            <TableHeader>
              <FormattedMessage
                id="VARIABLE_DOSE_DOSE_COLUMN"
                defaultMessage="Dose"
              />
            </TableHeader>
            <TableHeader>
              <FormattedMessage
                id="VARIABLE_DOSE_FREQUENCY_COLUMN"
                defaultMessage="Frequency"
              />
            </TableHeader>
            <TableHeader>
              <FormattedMessage
                id="VARIABLE_DOSE_DURATION_COLUMN"
                defaultMessage="Duration"
              />
            </TableHeader>
            <TableHeader>
              <FormattedMessage
                id="VARIABLE_DOSE_ACTIONS_COLUMN"
                defaultMessage="Actions"
              />
            </TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {fhirDosages.map((dosage, index) => {
            const stageStatus = stageSchedules?.find(
              (s) => s.variableDosageSequence === dosage.sequence
            );
            const isScheduled = stageStatus?.isScheduled;
            const adminStarted = stageStatus?.administrationStarted;
            const isActiveStage = index === activeStageIndex;

            const stage = stages[index];
            const stageLabel = stage.isLoadingDose
              ? stage.stageName
              : String(dosage.sequence - loadingDoseCount);
            const hasNote =
              stage.instructions ||
              stage.additionalInstructions ||
              stage.rate ||
              stage.additives;
            const noteTooltipContent = hasNote ? (
              <div>
                {stage.instructions && (
                  <>Instructions:&nbsp;{stage.instructions}</>
                )}
                {stage.additionalInstructions && (
                  <>
                    {stage.instructions && (
                      <>
                        <br />
                        <div className="tooltip-content-separater" />
                      </>
                    )}
                    Additional Instructions:&nbsp;
                    {stage.additionalInstructions}
                  </>
                )}
                {stage.rate && (
                  <>
                    {(stage.instructions || stage.additionalInstructions) && (
                      <>
                        <br />
                        <div className="tooltip-content-separater" />
                      </>
                    )}
                    Rate:&nbsp;{stage.rate} ml/hr
                  </>
                )}
                {stage.additives && (
                  <>
                    {(stage.instructions ||
                      stage.additionalInstructions ||
                      stage.rate) && (
                      <>
                        <br />
                        <div className="tooltip-content-separater" />
                      </>
                    )}
                    Additives:&nbsp;{stage.additives}
                  </>
                )}
              </div>
            ) : null;

            return (
              <TableRow key={index} className="vdp-data-row">
                <TableCell>
                  <div className="stage-name-cell">
                    <span>{stageLabel}</span>
                    {hasNote && (
                      <TooltipCarbon
                        icon={() => (
                          <NoteIcon
                            className="stage-note-icon"
                            data-testid={`stage-note-icon-${index}`}
                          />
                        )}
                        content={noteTooltipContent}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatDate(startDates[index])}</TableCell>
                <TableCell>{stage.dose}</TableCell>
                <TableCell>{stage.frequency}</TableCell>
                <TableCell>{stage.duration}</TableCell>
                <TableCell>
                  {isActiveStage && (
                    <Link
                      disabled={isButtonDisabled}
                      onClick={() => {
                        if (!isButtonDisabled) onAddToDrugChart(index);
                      }}
                    >
                      <FormattedMessage
                        id="ADD_TO_DRUG_CHART"
                        defaultMessage="Add to Drug Chart"
                      />
                    </Link>
                  )}
                  {isScheduled && !adminStarted && (
                    <Link
                      disabled={isReadMode}
                      onClick={() => {
                        if (!isReadMode) onEditDrugChart(index);
                      }}
                    >
                      <FormattedMessage
                        id="EDIT_DRUG_CHART"
                        defaultMessage="Edit Drug Chart"
                      />
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

VariableDoseStagesTable.propTypes = {
  fhirDosages: PropTypes.array.isRequired,
  effectiveStartDate: PropTypes.number.isRequired,
  onAddToDrugChart: PropTypes.func,
  onEditDrugChart: PropTypes.func,
  stageSchedules: PropTypes.array,
  isAddToDrugChartDisabled: PropTypes.bool,
  isReadMode: PropTypes.bool,
  hasScheduleEditPrivilege: PropTypes.bool,
};

export default VariableDoseStagesTable;
