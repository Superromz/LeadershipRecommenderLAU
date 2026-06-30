from django.contrib import admin
from .models import AssessmentResult

@admin.register(AssessmentResult)
class AssessmentResultAdmin(admin.ModelAdmin):
    list_display  = ['user', 'predicted_class_name', 'created_at']
    list_filter   = ['predicted_class_name']
    readonly_fields = [f.name for f in AssessmentResult._meta.fields]
