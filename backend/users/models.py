from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for LAU Leadership Style Coach.
    Extends Django's AbstractUser with student-specific fields.
    """
    COUNTRY_CHOICES = [
        ('USA', 'United States'),
        ('JPN', 'Japan'),
        ('BRA', 'Brazil'),
        ('NGA', 'Nigeria'),
        ('IND', 'India'),
    ]
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    EDUCATION_CHOICES = [
        ('Bachelor', 'Bachelor'),
        ('Master', 'Master'),
        ('PhD', 'PhD'),
        ('Other', 'Other'),
    ]
    POSITION_CHOICES = [
        ('Junior', 'Junior'),
        ('Mid', 'Mid-level'),
        ('Senior', 'Senior'),
    ]

    email = models.EmailField(unique=True)
    country = models.CharField(max_length=3, choices=COUNTRY_CHOICES, default='USA')
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Male')
    education_level = models.CharField(max_length=20, choices=EDUCATION_CHOICES, default='Bachelor')
    work_experience_years = models.FloatField(default=0.0)
    position_level = models.CharField(max_length=10, choices=POSITION_CHOICES, default='Junior')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
