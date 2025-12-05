import React, { useState } from 'react';


export const QualificationFilter: React.FC = () => {
 

  

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find Opportunities by Your 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Qualification</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your current qualification level to discover relevant courses and job opportunities tailored for you.
          </p>
        </div>


      
      </div>
    </section>
  );
};