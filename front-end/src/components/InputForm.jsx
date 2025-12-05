import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputForm = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon, // Pass a Lucide icon component (e.g., User, Mail)
  required = false,
  error = '',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label - Styled matching Login.jsx */}
      {label && (
        <label className="text-sm font-bold font-outfit text-txt-primary uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input Container - Styled matching SearchBar.jsx */}
      <div 
        className={`
          group w-full flex items-center gap-3 py-3 px-4 rounded-xl 
          border transition-all duration-200 
          bg-surface
          ${error 
            ? 'border-red-500 focus-within:ring-red-200' 
            : 'border focus-within:ring-2 focus-within:ring-offset-2 border-txt-dark hover:border-txt-placeholder transition-all duration-200 focus-within:border-txt-placeholder focus-within:outline-none focus-within:ring-border gap-2 py-2 px-6 rounded-lg bg-surface'
          }
        `}
      >
        {/* Left Icon (Optional) */}
        {Icon && (
          <div className={`
            transition-colors duration-200
            ${error ? 'text-red-400' : 'text-txt-dark group-focus-within:text-txt-accent'}
          `}>
            <Icon size={20} />
          </div>
        )}

        {/* The Input Field */}
        <input
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full bg-transparent outline-none font-medium font-roboto text-txt-primary placeholder-txt-placeholder text-base"
          {...props}
        />

        {/* Password Toggle (Auto-appears for password types) */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-txt-placeholder hover:text-txt-dark transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <span className="text-xs font-medium text-red-500 font-roboto ml-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default InputForm;