const navigation = [
    {
        path : "/"
    }
]

export const ProtectedRoutes = () => {
    const { user } = useAuth(); // Assuming you have a custom hook for authentication

    return (
        <Routes>
            {navigation.map((route, index) => {
                return (
                    <Route
                        key={index}
                        path={route.path}
                        element={
                            user ? (
                                <ProtectedComponent />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                );
            })}
        </Routes>
    );
}