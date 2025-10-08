import { useRef, useEffect, useState, useCallback } from 'react';
import SignaturePad from 'signature_pad'; // Install: npm install signature_pad

const useSignatureCanvas = (initialSignature = '') => {
    const canvasRef = useRef(null);
    const signaturePadRef = useRef(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [currentSignature, setCurrentSignature] = useState(initialSignature);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            signaturePadRef.current = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)', // Ensure white background
                penColor: 'rgb(0, 0, 0)'
            });

            signaturePadRef.current.onBegin = () => setIsEmpty(false);
            signaturePadRef.current.onEnd = () => {
                const data = signaturePadRef.current.toDataURL();
                setCurrentSignature(data);
                setIsEmpty(signaturePadRef.current.isEmpty());
            };

            // If an initial signature (Base64) is provided, load it
            if (initialSignature) {
                try {
                    signaturePadRef.current.fromDataURL(initialSignature);
                    setIsEmpty(signaturePadRef.current.isEmpty());
                } catch (error) {
                    console.error("Error loading initial signature:", error);
                    // Reset if data is invalid
                    signaturePadRef.current.clear();
                    setIsEmpty(true);
                    setCurrentSignature('');
                }
            } else {
                 setIsEmpty(true);
            }

            // Cleanup
            return () => {
                signaturePadRef.current.off();
                signaturePadRef.current.clear();
                signaturePadRef.current = null;
            };
        }
    }, [initialSignature]); // Re-initialize if initial signature changes (e.g., when resetting form)

    // Set canvas dimensions
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext('2d').scale(ratio, ratio);
            
            // Reload signature data if canvas was resized and has content
            if (!signaturePadRef.current.isEmpty()) {
                const data = signaturePadRef.current.toDataURL(); // Save current content
                signaturePadRef.current.clear(); // Clear before resizing
                signaturePadRef.current.fromDataURL(data); // Reload after resize
            }
        }
    }, []);

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    const clearSignature = () => {
        signaturePadRef.current.clear();
        setIsEmpty(true);
        setCurrentSignature('');
    };

    const getSignatureImage = () => {
        if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
            return '';
        }
        return signaturePadRef.current.toDataURL(); // Returns Base64 PNG
    };

    return {
        canvasRef,
        clearSignature,
        getSignatureImage,
        isEmpty,
        currentSignature, // Expose current signature data
        resizeCanvas // Expose resize for external triggers if needed
    };
};

export default useSignatureCanvas;