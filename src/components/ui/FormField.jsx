import React from 'react';
import { FormField as SharedFormField, TextAreaField as SharedTextAreaField, SelectField as SharedSelectField } from '../shared/FormField.jsx';

export default function FormField({ type = 'text', children, ...props }) {
    if (type === 'textarea') {
        return <SharedTextAreaField {...props} />;
    }
    if (type === 'select') {
        return <SharedSelectField {...props}>{children}</SharedSelectField>;
    }
    return <SharedFormField type={type} {...props} />;
}

export { SharedTextAreaField as TextAreaField, SharedSelectField as SelectField };
