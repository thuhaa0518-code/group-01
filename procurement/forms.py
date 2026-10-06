from django import forms
from .models import User, PurchaseRequest, PRItem, Quotation, Supplier, Receiving

class LoginForm(forms.Form):
    username = forms.CharField(label="Tên đăng nhập", widget=forms.TextInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500', 'placeholder': 'Ví dụ: employee1, manager1, admin1...'}))
    password = forms.CharField(label="Mật khẩu", widget=forms.PasswordInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}))

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['name', 'email', 'department', 'language']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'autocomplete': 'name'}),
            'email': forms.EmailInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'autocomplete': 'email'}),
            'department': forms.TextInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'language': forms.Select(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
        }

class UserCreateForm(forms.ModelForm):
    password = forms.CharField(label="Mật khẩu", widget=forms.PasswordInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'autocomplete': 'new-password'}))
    
    class Meta:
        model = User
        fields = ['username', 'email', 'name', 'role', 'department', 'password', 'is_active']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'autocomplete': 'username'}),
            'email': forms.EmailInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'autocomplete': 'email'}),
            'name': forms.TextInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'autocomplete': 'name'}),
            'role': forms.Select(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'department': forms.TextInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'w-4 h-4 text-blue-600 rounded focus:ring-blue-500'}),
        }

class UserEditForm(forms.ModelForm):
    new_password = forms.CharField(label="Mật khẩu mới (Bỏ trống nếu không đổi)", widget=forms.PasswordInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'autocomplete': 'new-password'}), required=False)

    class Meta:
        model = User
        fields = ['email', 'name', 'role', 'department', 'is_active']
        widgets = {
            'email': forms.EmailInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'autocomplete': 'email'}),
            'name': forms.TextInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'autocomplete': 'name'}),
            'role': forms.Select(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'department': forms.TextInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'w-4 h-4 text-blue-600 rounded focus:ring-blue-500'}),
        }


class PurchaseRequestForm(forms.ModelForm):
    class Meta:
        model = PurchaseRequest
        fields = ['title', 'category', 'department']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'placeholder': 'VD: Mua 5 laptop cho nhân viên kỹ thuật'}),
            'category': forms.TextInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'placeholder': 'VD: Thiết bị IT & Điện tử'}),
            'department': forms.Select(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
        }

class PRItemForm(forms.ModelForm):
    class Meta:
        model = PRItem
        fields = ['name', 'specs', 'quantity', 'unit', 'est_unit_price']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'specs': forms.TextInput(attrs={'class': 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'quantity': forms.NumberInput(attrs={'class': 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'min': 1}),
            'unit': forms.TextInput(attrs={'class': 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'est_unit_price': forms.NumberInput(attrs={'class': 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'min': 0}),
        }

class ManagerApprovalForm(forms.Form):
    ACTION_CHOICES = (
        ('APPROVE', 'Phê duyệt (Approve)'),
        ('TRANSFER_TO_FINANCE', 'Chuyển sang Finance kiểm tra ngân sách'),
        ('REQUEST_EDIT', 'Yêu cầu chỉnh sửa (Request Edit)'),
        ('REJECT', 'Từ chối (Reject)'),
    )
    action = forms.ChoiceField(choices=ACTION_CHOICES, widget=forms.RadioSelect(attrs={'class': 'space-y-2'}), label="Quyết định")
    comments = forms.CharField(widget=forms.Textarea(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'rows': 3, 'placeholder': 'Nhập ghi chú hoặc lý do (bắt buộc khi từ chối/yêu cầu sửa)...'}), required=False, label="Ghi chú / Lý do")

class FinanceApprovalForm(forms.Form):
    ACTION_CHOICES = (
        ('APPROVE', 'Phê duyệt Ngân sách (Approve Budget)'),
        ('REJECT', 'Từ chối (Reject)'),
    )
    action = forms.ChoiceField(choices=ACTION_CHOICES, widget=forms.RadioSelect(attrs={'class': 'space-y-2'}), label="Quyết định Finance")
    comments = forms.CharField(widget=forms.Textarea(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'rows': 3}), required=False, label="Ghi chú ý kiến Finance")

class QuotationUploadForm(forms.ModelForm):
    class Meta:
        model = Quotation
        fields = ['supplier', 'file_name', 'file_type', 'shipping_fee', 'delivery_days', 'warranty_months']
        widgets = {
            'supplier': forms.Select(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'file_name': forms.TextInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'file_type': forms.TextInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'shipping_fee': forms.NumberInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'delivery_days': forms.NumberInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'warranty_months': forms.NumberInput(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
        }

class ReceivingForm(forms.ModelForm):
    class Meta:
        model = Receiving
        fields = ['type', 'note']
        widgets = {
            'type': forms.Select(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500'}),
            'note': forms.Textarea(attrs={'class': 'w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500', 'rows': 3}),
        }
