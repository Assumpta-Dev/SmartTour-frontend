import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NFCScanner() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!('NDEFReader' in window)) return;
    const startScan = async () => {
      try {
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        ndef.onreading = ({ message }: any) => {
          for (const record of message.records) {
            if (record.recordType === 'text' || record.recordType === 'url') {
              const text = new TextDecoder().decode(record.data);
              // Support NFC tag with nfcId directly or embedded in URL
              const urlMatch = text.match(/\/nfc\/([^/\s]+)/);
              const idMatch  = text.match(/\/object\/([^/\s]+)/);
              if (urlMatch) navigate(`/nfc/${urlMatch[1]}`);
              else if (idMatch) navigate(`/object/${idMatch[1]}`);
              else navigate(`/nfc/${text.trim()}`);
            }
          }
        };
      } catch (_) {}
    };
    startScan();
  }, [navigate]);

  return null;
}
