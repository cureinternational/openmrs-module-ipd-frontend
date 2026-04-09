import React, { useEffect, useState, useRef } from "react";
import { AlignBoxMiddleLeft24 } from "@carbon/icons-react";
import "./DraftIndicator.scss";
import DraftOverlay from "./DraftOverlay";
import { mockFormDrafts } from "./DraftOverlayMockData";

const getFormDrafts = async () => {
  return mockFormDrafts;
};

export const DraftIndicator = () => {
  const [formDrafts, setFormDrafts] = useState([]);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const indicatorRef = useRef(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const drafts = await getFormDrafts();
        setFormDrafts(drafts);
      } catch (error) {
        console.error("Failed to initialize draft indicator", error);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        indicatorRef.current &&
        !indicatorRef.current.contains(event.target)
      ) {
        setIsOverlayOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const toggleOverlay = () => setIsOverlayOpen((previous) => !previous);
  const closeOverlay = () => setIsOverlayOpen(false);
  const hasDrafts = formDrafts.length > 0;

  return (
    <div className="ipd-draft-indicator" ref={indicatorRef}>
      <button
        className="ipd-draft-indicator__button"
        onClick={toggleOverlay}
        aria-label="View observation drafts"
        aria-expanded={isOverlayOpen}
      >
        <span className="ipd-draft-indicator__icon-wrapper">
          <AlignBoxMiddleLeft24 className="ipd-draft-indicator__icon" />
          {hasDrafts && (
            <span className="ipd-draft-indicator__red-dot" aria-hidden="true" />
          )}
        </span>
      </button>
      {isOverlayOpen && (
        <div className="ipd-draft-indicator__overlay-wrapper">
          <DraftOverlay formDrafts={formDrafts} onClose={closeOverlay} />
        </div>
      )}
    </div>
  );
};

export default DraftIndicator;
