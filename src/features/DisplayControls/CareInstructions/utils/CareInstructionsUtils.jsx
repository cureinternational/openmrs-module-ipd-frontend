import axios from "axios";
import { BAHMNI_CORE_OBSERVATIONS_BASE_URL } from "../../../../constants";

const OBSERVATIONS_URL = BAHMNI_CORE_OBSERVATIONS_BASE_URL.replace(/\?$/, "");

export const fetchCareInstructionsObs = async (visitUuid, conceptNames) => {
  try {
    const response = await axios.get(OBSERVATIONS_URL, {
      params: { visitUuid, concept: conceptNames },
      withCredentials: true,
    });
    return response.data;
  } catch (e) {
    return [];
  }
};

export const mapObservationsToInstructions = (observations, formConcepts) => {
  if (!observations || !formConcepts || formConcepts.length === 0) {
    return [];
  }

  const formNameToConceptsMap = {};
  formConcepts.forEach((fc) => {
    formNameToConceptsMap[fc.formName] = fc.concepts;
  });

  return observations
    .filter((obs) => obs.formFieldPath != null)
    .map((obs) => {
      const formName = obs.formFieldPath.split(".")[0];
      return { ...obs, _formName: formName };
    })
    .filter((obs) => formNameToConceptsMap[obs._formName] != null)
    .filter(
      (obs) =>
        obs.concept &&
        obs.concept.name &&
        formNameToConceptsMap[obs._formName].includes(obs.concept.name)
    )
    .map((obs) => {
      const value =
        obs.value != null
          ? typeof obs.value === "object"
            ? obs.value.display ?? obs.value.name ?? ""
            : String(obs.value)
          : "";

      return {
        encounterUuid: obs.encounterUuid,
        encounterDateTime: obs.encounterDateTime,
        form: obs._formName,
        instructionType: obs.concept.name,
        instruction: value,
        providerName: obs.providers?.[0]?.name ?? "",
        action: "",
      };
    });
};
