import React from "react";
import PropTypes from "prop-types";
import { NoteTile } from "./NoteTile";
import AmendmentHistory from "../../../../components/AmendmentHistory/AmendmentHistory";

const NoteHistory = ({ hostData }) => {
  console.log("hostData in NoteHistory", hostData);
  const { ack, fil, amended } = hostData.notes
    ? hostData.notes.reduce(
        (acc, note) => {
          if (note.acknowledgement) {
            acc.ack.push(note);
          } else if (note.previousNoteUuid === null) {
            acc.fil.push(note);
          } else {
            acc.amended.push(note);
          }
          return acc;
        },
        { ack: [], fil: [], amended: [] }
      )
    : { ack: [], fil: [], amended: [] };

  let original = null;
  let newNote = null;

  const first = fil[0];
  if (first) {
    first.amendmentReason === null ? (original = first) : (newNote = first);
  }
  amended.sort((a, b) => b.recordedTime - a.recordedTime);
  return (
    <>
      {ack.length > 0 && (
        <NoteTile
          tagLabel="Acknowledged"
          tagType="green"
          scheduledTime={ack[0].acknowledgement.acknowledgedTime}
          performerName={ack[0].acknowledgement.approvedBy.display}
          noteText={ack[0].text}
          noteReason={ack[0].amendmentReason}
        />
      )}
      {amended.length > 0 && <AmendmentHistory amendments={amended} />}
      {original && (
        <NoteTile
          tagLabel={"Original"}
          tagType="gray"
          scheduledTime={original.recordedTime}
          performerName={original.author.display}
          noteText={original.text}
        />
      )}
      {newNote && (
        <NoteTile
          tagLabel={"New"}
          tagType="gray"
          scheduledTime={newNote.recordedTime}
          performerName={newNote.author.display}
          noteText={newNote.text}
          noteReason={newNote.amendmentReason}
        />
      )}
    </>
  );
};

NoteHistory.propTypes = {
  hostData: PropTypes.object.isRequired,
};

export default NoteHistory;
