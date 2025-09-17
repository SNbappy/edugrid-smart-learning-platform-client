import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfPreview = ({ url, height = "200px" }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const onDocumentLoadError = () => {
        setError(true);
        setLoading(false);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
                <p className="text-gray-500">Unable to load PDF</p>
            </div>
        );
    }

    return (
        <div className="relative bg-white rounded-lg overflow-hidden" style={{ height }}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">Loading PDF...</p>
                </div>
            )}

            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading=""
            >
                <Page
                    pageNumber={pageNumber}
                    width={300}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                />
            </Document>

            {numPages > 1 && !loading && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    Page {pageNumber} of {numPages}
                </div>
            )}
        </div>
    );
};

export default PdfPreview;
