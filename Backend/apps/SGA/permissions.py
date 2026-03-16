from rest_framework.permissions import BasePermission, SAFE_METHODS


class SoloAdminBajaAlta(BasePermission):
    """Cualquier usuario autenticado puede leer y editar.
    Solo admin puede modificar el campo 'baja'."""
    message = "Solo los administradores pueden dar de baja o alta una operación."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        if 'baja' in request.data and not request.user.is_staff:
            return False
        return True


class SoloAdminEscritura(BasePermission):
    """Solo admin puede crear, editar o eliminar. 
    Usuarios autenticados pueden leer."""
    message = "Solo los administradores pueden realizar esta acción."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_staff


class SoloAdmin(BasePermission):
    """Solo administradores pueden acceder, ni siquiera leer."""
    message = "No tenés permiso para acceder a este recurso."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_staff