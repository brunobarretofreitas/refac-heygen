import { Button, Input, Space } from "antd";
import React, { useState } from "react";

interface TextInputProps {
  placeholder?: string;
  buttonText?: string;
  onButtonClick?: (value: string) => void;
  isLoading?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  placeholder = "Enter text",
  buttonText = "Submit",
  onButtonClick,
  isLoading = false,
}) => {
  const [value, setValue] = useState<string>();

  const handleButtonClick = () => {
    if (!!value && onButtonClick) {
      setValue(undefined);
      onButtonClick(value);
    }
  };

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
      <Button type="primary" onClick={handleButtonClick} loading={isLoading}>
        {buttonText}
      </Button>
    </Space.Compact>
  );
};

export default TextInput;
