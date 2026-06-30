from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'country', 'education_level', 'position_level']
    fieldsets = UserAdmin.fieldsets + (
        ('Student Profile', {'fields': ('country', 'age', 'gender', 'education_level', 'work_experience_years', 'position_level')}),
    )
