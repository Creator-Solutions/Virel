<?php


namespace App\Application\Auth\Github\GitSessionCallback;

class GitCallbackCommand{

   public function __construct(
      public string $code
   )
   {
   }
}