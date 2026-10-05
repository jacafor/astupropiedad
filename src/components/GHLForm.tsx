"use client";

import React from 'react';

interface GHLFormProps {
  formId?: string;
  source?: string;
  className?: string;
}

const GHLForm: React.FC<GHLFormProps> = ({ 
  formId = "DEFAULT_FORM_ID", 
  source = "https://link.as-tupropiedad.pe/widget/form/",
  className = "" 
}) => {
  return (
    <div className={`ghl-form-container overflow-hidden rounded-xl bg-white shadow-lg ${className}`}>
      <iframe
        src={`${source}${formId}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        id={`ghl-form-${formId}`}
        title="GoHighLevel Form"
        className="min-h-[500px]"
      />
      <script src="https://link.as-tupropiedad.pe/js/form_embed.js" async></script>
    </div>
  );
};

export default GHLForm;
