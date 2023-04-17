import {createContext, ReactNode, useState} from "react";

type AuthContextValue = {
	isLogged: boolean;
	updateLogStatus: (status: boolean) => void;
}

export const AuthContext = createContext<AuthContextValue>({
	isLogged: false,
	updateLogStatus: () => {},
});

type AuthProviderProps = {
	children: ReactNode;
}

// Le provider va pouvoir fournir a TOUS ses enfants la valeur 'isLogged',
// et la fonction 'updateLogStatus(newstatus)'. Toute logique de validation
// de modification de status est a faire dans cette fct. 
// UTILISATION:
//<ACommponentWIHTOUTACCESS/>
// <AuthProvider> 		// all childs compo has access
// 		<ACommponent/>
// 		<CompoWithChilds>
// 			<AnotherCompo/>
// 		</CompoWithChilds>
// </AuthProvider>
export function AuthProvider({ children }: AuthProviderProps) {
	const [isLogged, setIsLogged] = useState(false);

	// TODO: mettre ici la logique de validation d'auth
	function updateLogStatus(status: boolean) {
		setIsLogged(status);
	}

	return (
		<AuthContext.Provider value={{isLogged, updateLogStatus}} >
			{children}
		</AuthContext.Provider>

	);
}
