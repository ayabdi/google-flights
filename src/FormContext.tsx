import React, { createContext, useState, ReactNode } from "react";

interface FormState {
  tripType: string;
  passengers: number;
  travelClass: string;
  from: string;
  to: string;
  departureDate: Date | null;
  returnDate: Date | null;
}

interface FormContextProps {
  formState: FormState;
  handleChange: (field: string, value: any) => void;
}

export const FormContext = createContext<FormContextProps | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formState, setFormState] = useState<FormState>({
    tripType: "round-trip",
    passengers: 1,
    travelClass: "economy",
    from: "Doha",
    to: "",
    departureDate: null,
    returnDate: null,
  });

  const handleChange = (field: string, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  return (
    <FormContext.Provider value={{ formState, handleChange }}>
      {children}
    </FormContext.Provider>
  );
};