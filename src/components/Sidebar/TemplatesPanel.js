import React from 'react';

const TemplatesPanel = ({ templates, selectedTemplate, handleLoadTemplate }) => {
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-2">Templates</h3>
      <select 
        className="w-full p-2 border rounded mb-2"
        onChange={(e) => handleLoadTemplate(e.target.value)}
        value={selectedTemplate?.id || ''}
      >
        <option value="">Select a template</option>
        {templates.map(template => (
          <option key={template.id} value={template.id}>{template.name}</option>
        ))}
      </select>
    </div>
  );
};

export default TemplatesPanel;