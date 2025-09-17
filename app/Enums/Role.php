<?php

namespace App\Enums;

enum Role: string
{
    case ADMIN = 'admin';
    case JUNIOR_DEVELOPMENT_COACH = 'junior_development_coach';
    case OBSERVER = 'observer';
    case PLAYER = 'player';
}
