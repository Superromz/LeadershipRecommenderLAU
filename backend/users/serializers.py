from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'password',
            'country', 'age', 'gender',
            'education_level', 'work_experience_years', 'position_level',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username',
            'country', 'age', 'gender',
            'education_level', 'work_experience_years', 'position_level',
            'target_leadership_style', 'is_staff',
        ]
        read_only_fields = ['id', 'email', 'is_staff']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserProfileSerializer(self.user).data
        return data
