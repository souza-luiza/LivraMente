interface FireIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function FireIcon({
  size,
  ...props }: FireIconProps) {

  return (
    <svg
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 90 90"
      fill="currentColor"
      {...props}
    >
      <path d="M 35.975 8.565 C 35.439 9.976, 35 11.755, 35 12.518 C 35 15.027, 32.694 19.360, 25.962 29.500 C 14.625 46.575, 12.303 57.196, 17.588 67.801 C 21.673 75.999, 32.935 84.491, 38.817 83.809 C 42.684 83.361, 42.617 80.826, 38.598 75.560 C 32.241 67.232, 32.039 60.211, 37.994 54.506 L 41 51.626 41 55.379 C 41 60.244, 42.140 62.303, 48.642 69.183 C 51.597 72.308, 54.894 76.921, 55.971 79.433 C 58.501 85.335, 60.968 85.450, 66.089 79.904 C 74.669 70.610, 77.077 58.130, 73.094 43.611 C 69.050 28.870, 65.795 26.202, 61.919 34.449 C 60.769 36.896, 59.191 39.426, 58.414 40.072 C 57.249 41.038, 57 40.722, 57 38.279 C 57 34.098, 53.589 24.683, 49.883 18.632 C 42.333 6.307, 38.021 3.186, 35.975 8.565"
      stroke="none" 
      fill="currentColor" 
      fillRule="evenodd"/>
</svg>
  );
}

{/* <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g clip-path="url(#clip0_476_775)">
<rect y="0.5" width="90" height="90" fill="url(#pattern0_476_775)" fill-opacity="0.65"/>
</g>
<defs>
<pattern id="pattern0_476_775" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_476_775" transform="scale(0.0111111)"/>
</pattern>
<clipPath id="clip0_476_775">
<rect width="90" height="90" fill="white"/>
</clipPath>
<image id="image0_476_775" width="90" height="90" preserveAspectRatio="none" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEsUlEQVR4nO3dbaifYxzA8cvD2KZ5TGGiCUnIQ0MKL/bQiJSHvfNikYg1lBezTdFhHJY8hSwPMcSEV7QUMlKLEYuY1XDEbGebPdjxsK+u/lf5d859/v/7vq7rvn+/677vz6u1zv3/Xb9f/65z3dfTMabVarVarVarkYADgAeAX4AhYKn9P+l21Q5wP2O9BOwj3bZaofNNzrJIum21ARzE+PYCV0q3sRaAafS2AzhFup3JA86jv7XAROm2Jg24kXwel25r0oAV5He5dHuTBOzrxs152Z89VLrdyQFmUtyz0u1ODvAyfuZItz0ZwNHAn56F3tCOQnICHibMQukc1AOOAnYHFvoP+znSuagGLCeO5dK5aH8T/DdSoe3nnCGdkzrAfsAa4npVOi91gDuI7x/gJOnc1ABOjvALcDxPSeenqctYTXn22HG5aTrgTso3YJoMOBsYqaDQG+0klWkiYCLwFdW52DQR8ATVat4LDDDHLa5WaVu/ySZgAvAQ8Bvwu/v3BJMiOzkP/IyMnqvmwGDGM8tMioDnkfN0n2/zcMYzu5NbuQEuQ9YPPdo2o8dzt5hUAIcVXAMsy1SPheAvTCqAF9Hhioy2HZFjRWe60U5Bl9Ht7oz23UN/z5gEXkzWo8eKUe2b6raW9bNd9XZhYDG6fDyqfW8WeHaW0Qg4BtiJLhu72nd7wWcfNRoBj6HPsGvbXI9lsw1GG+BYNxeszQiwwK2++DjNaGJ3eFJPC40WwCEK++ZYPjFaAPOpr7+BKUaDiif0JczWsjxVdwMaCn0X9fe+hkLH3m2k0XbRA6XAkRH3zml3omShZ9Mc19Rt/9xodlfTdchbLFloexi+LLuAG2zfCNyMvOckC/1piTuNzvKc2izLh5KF/raEhH4Cjh8V50vkfS9Z6F8jJzMMnJoRZzPyNslUuVOA2NOi88aJY3cRSdtTfYX/L4Dv2cAsH4z3UlBSF1XUSPUV7n9bjI/pPeK8hpKVGhHAukhJrOkT53rk/VhdZccW4K1ISSzJsbBgd4dKWltdZccWYEmkJGbmiDWArDeqqWp28peUuT+uGzDZjmWR86CRAkzKueunn8k5450vuNKeOfRM4Z6NbpMKxJuHDNnbyYBLIyRxQsGYi6jWZvGbJN3sWuji7CyPuPbO0qq8YjQArg1MZNAz7r1UY65RdOz4s4BE1gXEzrPXOXReXMe+jq4RQcj64YVKi63vvCLwSEBCK5Xu/TvHaAMcCHzumdBe4NzAX8qxj9qtMsrv4tjimdhHIcMod5v6uxELfYHRzPa3AW9wN0U4qWvvwgsV1JVVBrja7cQsamfodT22C/KM3T3SOM6kArgK+Msj0W+AgwNjLwso9HyTGveKvsMj2beB/QPiTvE8ubtK/HXbF3Cm20ZQ1Av2ZSgg7m0F430HHG5SRmdD5DsexV7p+8123+qtOeNsrc3fD6Az1r3V3SVaxH0BMZ/M8fl2NX+GqRs6x4RfL1DoLSWuAu3Ks5SWNDpF+DpHoYcC31a39Zhnvsg0AZ3uxBb8vR6FXhoYI+tKHztVMM00EXC6m4lb7Y4zDLm/nRV0y4C71mfQXVK1yV1SlXv5rNVqtVqtVssk4z9BKh09Aj1hdgAAAABJRU5ErkJggg=="/>
</defs>
</svg> */}
