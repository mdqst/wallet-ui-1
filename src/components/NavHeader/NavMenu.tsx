/* MIT License
 *
 * Copyright (c) 2024 Etherspot
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React from 'react';
import { Link } from 'react-router-dom';

// constants
import { routes } from '../../constants/routes';

/**
 * NavigationMenu component renders links based on the provided routes.
 * @returns JSX element representing the navigation menu.
 */

const NavigationMenu: React.FC = () => {
  return (
    <>
      {routes.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={classNames(
            // can apply different styles
            item.current ? 'bg-purple-300 text-black' : 'text-gray-300 hover:bg-purple-300 hover:text-black',
            'rounded-md px-3 py-2 text-sm font-medium'
          )}
          aria-current={item.current ? 'page' : undefined}
        >
          {item.name}
        </Link>
      ))}
    </>
  );
};

/**
 * Utility function to join class names conditionally.
 * @param classes - Array of class names.
 * @returns Joined class names string.
 */
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default NavigationMenu;
