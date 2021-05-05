
import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement(document.getElementById('root'));

export default function ErrorModal(props) {

    const [open, setOpen] = useState(true)

    return (
        <Modal
        isOpen={open}
        onRequestClose={() => {setOpen(false)}}
        shouldCloseOnOverlayClick={false}
        style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            zIndex: 1000
          },
          content: {
            top: '40%',
            left: '40%',
            position: 'absolute',
            border: '1px solid #ccc',
            background: '#fff',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '20px',
            width: '20%',
            height: '20%',
            zIndex: 1001,
            transition: '1s ease-in'
          },
        }}
      >
        <div className="ConfirmBox" >
            <div className="ErrorMessage confirm">
                <div className="ErrorIcon">!</div>
                <div className="smargin">{props.msg}</div>
            </div>
            <div className="ConfirmButtonContainer">
                <button className="btn3" onClick={props.confirmCallback}>Ok</button>
                <button className="btn3" onClick={() => {setOpen(false); window.location.reload()}}>Cancel</button>
            </div>
        </div>
      </Modal>
    )
}