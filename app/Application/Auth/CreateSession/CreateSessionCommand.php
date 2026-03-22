<?php

namespace App\Application\Auth\CreateSession;

class CreateSessionCommand{

   public function __construct(
      public string $email,
      public string $password
   )
   {
   }
}