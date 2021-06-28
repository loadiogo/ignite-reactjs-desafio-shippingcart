import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productIndex = cart.findIndex((product: Product) => product.id === productId);
      let productNovo;
      if(productIndex < 0){
        const response = await api.get(`products/${productId}`);   
        productNovo = response.data;              

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));         
        setCart([...cart, {...productNovo, amount: 1 }]);
        return;
      }     

      productNovo = cart[productIndex];
      productNovo.amount += 1;      
      cart.splice(productIndex, 1, productNovo);   
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart)); 
      setCart([...cart]);
    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productIndex = cart.findIndex((product: Product) => product.id === productId);

      if(productIndex !== -1){
        cart.splice(productIndex, 1);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart)); 
        setCart([...cart]);
      }
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
        if(amount > 0){
            const productIndex = await cart.findIndex((product: Product) => product.id === productId);
        

            if(productIndex !== -1){
              cart[productIndex].amount = amount;
              localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart)); 
              setCart([...cart]);
            }
        }        
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
