<?php

namespace App\Domain\ValueObjects;

use Egulias\EmailValidator\EmailValidator;
use Egulias\EmailValidator\Validation\RFCValidation;

class Email
{
    private string $value;

    public function __construct(string $value)
    {
        $trimmedValue = trim($value);
        
        if ($trimmedValue === '') {
            throw new \InvalidArgumentException('Email cannot be empty');
        }

        $validator = new EmailValidator();
        $rfcValidation = new RFCValidation();
        
        if (!$validator->isValid($trimmedValue, $rfcValidation)) {
            throw new \InvalidArgumentException('Invalid email format: ' . $trimmedValue);
        }

        $this->value = $trimmedValue;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(Email $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
