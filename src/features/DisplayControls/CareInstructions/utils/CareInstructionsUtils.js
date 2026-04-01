import axios from "axios";
import { FETCH_ALL_OBSERVATIONS_IN_ENCOUNTER_URL } from "../../../../constants";

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
          value:
            obs.value != null
              ? typeof obs.value === "object"
                ? obs.value.display ?? obs.value.name ?? ""
                : String(obs.value)
              : "",
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
