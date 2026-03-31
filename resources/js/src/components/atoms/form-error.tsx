interface FormErrorProps {
  message?: string;
}

function FormError({ message }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-virel-errorText">{message}</p>;
}

export { FormError };
export type { FormErrorProps };
