import axios from "axios";
import { ALLERGIES_BASE_URL, GLOBAL_PROPERTY_URL } from "../../../../constants";

export const fetchAllergiesData = async (patientUuid) => {
  const FETCH_ALLERGIES_URL = `${ALLERGIES_BASE_URL}?patient=${patientUuid}&_summary=data`;
  try {
    return await axios.get(FETCH_ALLERGIES_URL);
  } catch (error) {
    return error;
  }
};

export const fetchNoKnownAllergyCode = async () => {
  const GLOBAL_PROPERTY_URL = `${ALLERGIES_BASE_URL}/globalProperty/noKnownAllergyCode`;
  try {
    return (await axios.get(GLOBAL_PROPERTY_URL)).data;
  } catch (error) {
    return error;
  }
};

export const getNoKnownAllergyCode = async () => {
  try {
    const response = await axios.get(GLOBAL_PROPERTY_URL, {
      params: {
        property: "allergy.concept.noKnownAllergyCode",
      },
      withCredentials: true,
      headers: {
        Accept: "text/plain",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching no known allergy code:", error);
    throw error;
  }
};
