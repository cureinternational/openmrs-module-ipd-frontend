import React from "react";
import axios from "axios";
import { FETCH_ALL_OBSERVATIONS_IN_ENCOUNTER_URL } from "../../../../constants";
import { FormattedMessage } from "react-intl";

export const careInstructionsHeaders = [
  {
    key: "dateAndTime",
    header: (
      <FormattedMessage
        id={"DATE_AND_TIME_COLUMN_HEADER"}
        defaultMessage={"Date and Time"}
      />
    ),
  },
  {
    key: "form",
    header: (
      <FormattedMessage id={"FORM_COLUMN_HEADER"} defaultMessage={"Form"} />
    ),
  },
  {
    key: "instructionType",
    header: (
      <FormattedMessage
        id={"INSTRUCTION_TYPE_COLUMN_HEADER"}
        defaultMessage={"Instruction Type"}
      />
    ),
  },
  {
    key: "instruction",
    header: (
      <FormattedMessage
        id={"INSTRUCTION_COLUMN_HEADER"}
        defaultMessage={"Instruction"}
      />
    ),
  },
  {
    key: "providerName",
    header: (
      <FormattedMessage
        id={"PROVIDER_NAME_COLUMN_HEADER"}
        defaultMessage={"Provider Name"}
      />
    ),
  },
  {
    key: "action",
    header: (
      <FormattedMessage id={"ACTION_COLUMN_HEADER"} defaultMessage={"Action"} />
    ),
  },
];

export const extractInstructionsFromObs = (
  observations,
  configuredConcepts
) => {
  const results = [];
  if (!observations || !configuredConcepts || configuredConcepts.length === 0) {
    return results;
  }

  const searchObs = (obsList) => {
    obsList.forEach((obs) => {
      if (
        obs.concept &&
        obs.concept.name &&
        configuredConcepts.includes(obs.concept.name)
      ) {
        results.push({
          conceptName: obs.concept.name,
          value: obs.value != null ? String(obs.value) : "",
        });
      }
      if (obs.groupMembers && obs.groupMembers.length > 0) {
        searchObs(obs.groupMembers);
      }
    });
  };

  searchObs(observations);
  return results;
};

export const fetchEncounterObs = async (encounterUuid) => {
  try {
    const url = FETCH_ALL_OBSERVATIONS_IN_ENCOUNTER_URL.replace(
      "{encounterUuid}",
      encounterUuid
    );
    const response = await axios.get(url, { withCredentials: true });
    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
};
