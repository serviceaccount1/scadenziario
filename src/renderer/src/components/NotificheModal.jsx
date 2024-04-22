import { Button, Modal, ModalFooter, Spinner } from "react-bootstrap";
import ScadenzaItem from "./ScadenzaItem.jsx";
import { useState } from "react";

function NotificheModal({
  visible,
  toggleNotificationModal,
  scadenzeMap,
  updateRefs,
}) {
  let [isLoading, setIsLoading] = useState(false);

  async function notificaTutto() {
    setIsLoading(true);
    window.api
      .notificaTutto(scadenzeMap)
      .then((res) => {
        console.log(res);
        if (res.status == "error") {
          window.api.showErrorDialog(
            `Si è verificato un errore durante la notifica, errore: ${res.message}`,
          );
        } else {
          window.api.showNotification(
            "Successo",
            "Le notifiche sono avvenute con successo",
          );
        }
        setIsLoading(false);
        updateRefs();
      })
      .catch((err) => {
        window.api.showErrorDialog(
          `Si è verificato un errore durante la notifica, errore: ${err.message}`,
        );
        setIsLoading(false);
        updateRefs();
      });
  }
  return (
    <Modal fullscreen show={visible}>
      <Modal.Body>
        {scadenzeMap.length ? (
          scadenzeMap.map((x) => {
            return <ScadenzaItem data={x} />;
          })
        ) : (
          <center style={{ padding: 20 }}>
            <h2 style={{ color: "grey" }}>Nessuna scadenza</h2>
          </center>
        )}
      </Modal.Body>
      <ModalFooter>
        <Button
          disabled={isLoading}
          onClick={toggleNotificationModal}
          variant="danger"
        >
          Chiudi
        </Button>
        <Button
          style={{ minWidth: "100px" }}
          disabled={isLoading || !scadenzeMap.length}
          onClick={notificaTutto}
        >
          {!isLoading ? (
            "Notifica tutto"
          ) : (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default NotificheModal;
