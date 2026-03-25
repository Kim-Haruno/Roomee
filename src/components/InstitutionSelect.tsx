/**
 * ============================================
 * INSTITUTION SELECT COMPONENT
 * ============================================
 * 
 * A reusable dropdown component for selecting South African
 * educational institutions (universities, TVET colleges, private colleges).
 * 
 * Features:
 * - Grouped by institution type
 * - "Other" option with custom text input
 * - Search functionality within the dropdown
 * 
 * Usage:
 * <InstitutionSelect 
 *   value={selectedInstitution} 
 *   onChange={setSelectedInstitution} 
 * />
 */

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getInstitutionsByCategory } from '@/config/appConfig';

// ============================================
// COMPONENT PROPS
// ============================================

interface InstitutionSelectProps {
  /** Current selected value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Whether the field is required */
  required?: boolean;
  /** Custom label text (default: "Institution") */
  label?: string;
  /** Custom placeholder text */
  placeholder?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const InstitutionSelect = ({
  value,
  onChange,
  required = false,
  label = 'Institution',
  placeholder = 'Select your institution',
}: InstitutionSelectProps) => {
  // Track if user selected "Other" option
  const [isOther, setIsOther] = useState(false);
  // Store custom institution name when "Other" is selected
  const [customInstitution, setCustomInstitution] = useState('');

  // Get all institutions grouped by category from config
  const institutionCategories = getInstitutionsByCategory();

  /**
   * Handle dropdown selection change
   * If "other" is selected, show the custom input field
   */
  const handleSelectChange = (newValue: string) => {
    if (newValue === 'other') {
      setIsOther(true);
      // Clear the main value so user can type their own
      onChange(customInstitution);
    } else {
      setIsOther(false);
      setCustomInstitution('');
      onChange(newValue);
    }
  };

  /**
   * Handle custom institution input change
   * Updates the main value with the custom text
   */
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomInstitution(newValue);
    onChange(newValue);
  };

  // Check if the current value is a custom one (not in the predefined list)
  const isCustomValue = value && !institutionCategories.some(cat => 
    cat.institutions.includes(value)
  ) && value !== '';

  return (
    <div className="space-y-2">
      {/* Label for the field */}
      <Label htmlFor="institution">{label}</Label>

      {/* Main dropdown selector */}
      <Select
        value={isOther || isCustomValue ? 'other' : value}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {/* Loop through each category (Universities, TVET, Private) */}
          {institutionCategories.map((category) => (
            <SelectGroup key={category.category}>
              {/* Category header */}
              <SelectLabel className="text-primary font-semibold">
                {category.category}
              </SelectLabel>
              {/* Individual institutions in this category */}
              {category.institutions.map((institution) => (
                <SelectItem key={institution} value={institution}>
                  {institution}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}

          {/* "Other" option for custom institutions */}
          <SelectGroup>
            <SelectLabel className="text-muted-foreground font-semibold">
              Not Listed?
            </SelectLabel>
            <SelectItem value="other">Other (Type your own)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Custom input field - shown when "Other" is selected */}
      {(isOther || isCustomValue) && (
        <div className="space-y-1">
          <Input
            id="custom-institution"
            placeholder="Enter your institution name"
            value={isCustomValue && !isOther ? value : customInstitution}
            onChange={handleCustomInputChange}
            required={required}
          />
          <p className="text-xs text-muted-foreground">
            Type the name of your institution if not listed above
          </p>
        </div>
      )}
    </div>
  );
};
